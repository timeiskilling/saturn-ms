use std::pin;

use axum::body::Body;
use hyper::Response;
use pin_project::pin_project;
use std::task::Poll;

pub fn hybrid<MakeWeb, Grpc>(web: MakeWeb, grpc: Grpc) -> HybridMakeService<MakeWeb, Grpc> {
    HybridMakeService { web, grpc }
}

pub struct HybridMakeService<Axum, Grpc> {
    web: Axum,
    grpc: Grpc,
}

pub struct HybridService<Web, Grpc> {
    web: Web,
    grpc: Grpc,
}

#[pin_project(project = HybridBodyProj)]
pub enum HybridBody<WebBody, GrpcBody> {
    Web(#[pin] WebBody),
    Grpc(#[pin] GrpcBody),
}

impl<WebBody, GrpcBody> hyper::body::Body for HybridBody<WebBody, GrpcBody>
where
    WebBody: hyper::body::Body + Send + Unpin,
    GrpcBody: hyper::body::Body<Data = WebBody::Data> + Send + Unpin,
    WebBody::Error: std::error::Error + Send + Sync + 'static,
    GrpcBody::Error: std::error::Error + Send + Sync + 'static,
{
    type Data = WebBody::Data;

    type Error = Box<dyn std::error::Error + Send + Sync + 'static>;

    fn poll_frame(
        self: pin::Pin<&mut Self>,
        cx: &mut std::task::Context<'_>,
    ) -> Poll<Option<Result<hyper::body::Frame<Self::Data>, Self::Error>>> {
        match self.project() {
            HybridBodyProj::Web(pin) => pin.poll_frame(cx).map_err(|e| e.into()),
            HybridBodyProj::Grpc(pin) => pin.poll_frame(cx).map_err(|e| e.into()),
        }
    }

    fn is_end_stream(&self) -> bool {
        match self {
            HybridBody::Web(b) => b.is_end_stream(),
            HybridBody::Grpc(b) => b.is_end_stream(),
        }
    }

    fn size_hint(&self) -> hyper::body::SizeHint {
        match self {
            HybridBody::Web(b) => b.size_hint(),
            HybridBody::Grpc(b) => b.size_hint(),
        }
    }
}

#[pin_project]
pub struct HybridMakeServiceFuture<FutAxum, Grpc> {
    #[pin]
    fut_axum: FutAxum,
    grpc: Option<Grpc>,
}

impl<CoonInfo, Axum, Grpc> tower::Service<CoonInfo> for HybridMakeService<Axum, Grpc>
where
    Axum: tower::Service<CoonInfo>,
    Grpc: Clone,
{
    type Response = HybridService<Axum::Response, Grpc>;
    type Error = Axum::Error;
    type Future = HybridMakeServiceFuture<Axum::Future, Grpc>;

    fn poll_ready(
        &mut self,
        cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Result<(), Self::Error>> {
        self.web.poll_ready(cx)
    }

    fn call(&mut self, req: CoonInfo) -> Self::Future {
        HybridMakeServiceFuture {
            fut_axum: self.web.call(req),
            grpc: Some(self.grpc.clone()),
        }
    }
}

impl<WebFuture, Web, WebErr, Grpc> Future for HybridMakeServiceFuture<WebFuture, Grpc>
where
    WebFuture: Future<Output = Result<Web, WebErr>>,
{
    type Output = Result<HybridService<Web, Grpc>, WebErr>;

    fn poll(
        self: pin::Pin<&mut Self>,
        cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Self::Output> {
        let this = self.project();
        match this.fut_axum.poll(cx) {
            std::task::Poll::Ready(Ok(web)) => std::task::Poll::Ready(Ok(HybridService {
                web,
                grpc: this.grpc.take().expect("Cannot take poll twice"),
            })),
            std::task::Poll::Ready(Err(err)) => std::task::Poll::Ready(Err(err)),
            std::task::Poll::Pending => std::task::Poll::Pending,
        }
    }
}

impl<Web, Grpc, WebBody, GrpcBody> tower::Service<hyper::Request<Body>> for HybridService<Web, Grpc>
where
    Web: tower::Service<hyper::Request<Body>, Response = Response<WebBody>>,
    Grpc: tower::Service<hyper::Request<Body>, Response = Response<GrpcBody>>,
    Web::Error: Into<Box<dyn std::error::Error + Send + Sync + 'static>>,
    Grpc::Error: Into<Box<dyn std::error::Error + Send + Sync + 'static>>,

{
    type Response = hyper::Response<HybridBody<WebBody, GrpcBody>>;

    type Error = Box<dyn std::error::Error + Send + Sync + 'static>;

    type Future = HybridFuture<Web::Future, Grpc::Future>;

    fn poll_ready(
        &mut self,
        cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Result<(), Self::Error>> {
        match self.web.poll_ready(cx) {
            Poll::Ready(Ok(())) => match self.grpc.poll_ready(cx) {
                Poll::Ready(Ok(())) => Poll::Ready(Ok(())),
                Poll::Ready(Err(e)) => Poll::Ready(Err(e.into())),
                Poll::Pending => Poll::Pending,
            },
            Poll::Ready(Err(e)) => Poll::Ready(Err(e.into())),
            Poll::Pending => Poll::Pending,
        }
    }

    fn call(&mut self, req: hyper::Request<Body>) -> Self::Future {
        if req.headers().get("content-type").map(|x| x.as_bytes()) == Some(b"application/grpc") {
            HybridFuture::Grpc(self.grpc.call(req))
        } else {
            HybridFuture::Web(self.web.call(req))
        }
    }
}

#[pin_project(project = HybridFutureProj)]
pub enum HybridFuture<WebFuture, GrpcFuture> {
    Web(#[pin] WebFuture),
    Grpc(#[pin] GrpcFuture),
}

impl<WebFuture, GrpcFuture, WebBody, GrpcBody, WebError, GrpcError> Future
    for HybridFuture<WebFuture, GrpcFuture>
where
    WebFuture: Future<Output = Result<Response<WebBody>, WebError>>,
    GrpcFuture: Future<Output = Result<Response<GrpcBody>, GrpcError>>,
    WebError: Into<Box<dyn std::error::Error + Send + Sync + 'static>>,
    GrpcError: Into<Box<dyn std::error::Error + Send + Sync + 'static>>,
{
    type Output = Result<
        Response<HybridBody<WebBody, GrpcBody>>,
        Box<dyn std::error::Error + Send + Sync + 'static>,
    >;

    fn poll(
        self: pin::Pin<&mut Self>,
        cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Self::Output> {
        match self.project() {
            HybridFutureProj::Web(pin) => match pin.poll(cx) {
                Poll::Ready(Ok(res)) => Poll::Ready(Ok(res.map(HybridBody::Web))),
                Poll::Ready(Err(e)) => Poll::Ready(Err(e.into())),
                Poll::Pending => Poll::Pending,
            },
            HybridFutureProj::Grpc(pin) => match pin.poll(cx) {
                Poll::Ready(Ok(res)) => Poll::Ready(Ok(res.map(HybridBody::Grpc))),
                Poll::Ready(Err(e)) => Poll::Ready(Err(e.into())),
                Poll::Pending => Poll::Pending,
            },
        }
    }
}
