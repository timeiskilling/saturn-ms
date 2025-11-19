pub mod signer_wraper;

use std::marker::PhantomData;

pub trait ParallelProcessor: Sized {
    type Item;

    fn process_parallel<F>(&self, worker: F)
    where
        F: Fn(Self::Item) + Sync + Send;

    fn par_map<F, R>(self, transform: F) -> ParMap<Self, F>
    where
        F: Fn(Self::Item) -> R + Sync + Send,
        R: Send,
    {
        ParMap {
            source: self,
            transform,
            _phantom: PhantomData,
        }
    }

    fn par_filter<P>(self, predicate: P) -> ParFilter<Self, P>
    where
        P: Fn(&Self::Item) -> bool + Sync + Send,
    {
        ParFilter {
            source: self,
            predicate,
        }
    }

    fn par_for_each<F>(self, operation: F)
    where
        F: Fn(Self::Item) + Sync + Send,
    {
        self.process_parallel(operation);
    }

    fn par_collect<C>(self) -> C
    where
        C: Default + Extend<Self::Item> + Send,
        Self::Item: Send,
    {
        let result = std::sync::Mutex::new(C::default());

        self.process_parallel(|item| {
            result.lock().unwrap().extend(std::iter::once(item));
        });

        result.into_inner().unwrap()
    }
}

pub struct ParMap<Source, F> {
    source: Source,
    transform: F,
    _phantom: PhantomData<F>,
}

pub struct ParFilter<Source, P> {
    source: Source,
    predicate: P,
}

impl<T: Send + Clone> ParallelProcessor for Vec<T> {
    type Item = T;

    fn process_parallel<F>(&self, worker: F)
    where
        F: Fn(Self::Item) + Sync + Send,
    {
        for item in self.iter().cloned() {
            worker(item);
        }
    }
}

impl<Source, F, R> ParallelProcessor for ParMap<Source, F>
where
    Source: ParallelProcessor,
    F: Fn(Source::Item) -> R + Sync + Send + Clone,
    R: Send + Clone,
{
    type Item = R;

    fn process_parallel<Worker>(&self, worker: Worker)
    where
        Worker: Fn(Self::Item) + Sync + Send,
    {
        let transform = self.transform.clone();
        self.source.process_parallel(move |item| {
            let transformed = transform(item);
            worker(transformed);
        });
    }
}

impl<Source, P> ParallelProcessor for ParFilter<Source, P>
where
    Source: ParallelProcessor,
    P: Fn(&Source::Item) -> bool + Sync + Send + Clone,
    Source::Item: Clone,
{
    type Item = Source::Item;

    fn process_parallel<Worker>(&self, worker: Worker)
    where
        Worker: Fn(Self::Item) + Sync + Send,
    {
        let predicate = self.predicate.clone();
        self.source.process_parallel(move |item| {
            if predicate(&item) {
                worker(item);
            }
        });
    }
}

fn example_parallel_processing() {
    let numbers = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    let result: Vec<i32> = numbers
        .par_filter(|&x| x % 2 == 0)
        .par_map(|x| x * x)
        .par_collect();

    let type2: Vec<i32> = result.par_map(|x| x + 1).par_collect();
    println!("Результат: {:?}", type2);
}

pub trait DataSource {
    type Item;
    type Error;

    fn fetch_next(&mut self) -> Result<Option<Self::Item>, Self::Error>;
}

pub trait DataProcessor {
    type Source: DataSource;

    type Output;

    fn process(
        &mut self,
        source: &mut Self::Source,
    ) -> Result<Option<Self::Output>, <Self::Source as DataSource>::Error>;
}

pub trait ProcessingPipeline {
    type Source: DataSource;
    type FinalOutput;

    fn execute(
        &mut self,
        source: &mut Self::Source,
    ) -> Result<Vec<Self::FinalOutput>, <Self::Source as DataSource>::Error>;
}

pub struct DatabaseSource {
    connection: String,
    current_row: usize,
}

impl DataSource for DatabaseSource {
    type Item = String;
    type Error = String;

    fn fetch_next(&mut self) -> Result<Option<Self::Item>, Self::Error> {
        if self.current_row < 5 {
            self.current_row += 1;
            Ok(Some(format!("Рядок {}", self.current_row)))
        } else {
            Ok(None)
        }
    }
}

pub struct UppercaseProcessor;

impl DataProcessor for UppercaseProcessor {
    type Source = DatabaseSource;
    type Output = String;

    fn process(&mut self, source: &mut Self::Source) -> Result<Option<Self::Output>, String> {
        match source.fetch_next()? {
            Some(item) => Ok(Some(item.to_uppercase())),
            None => Ok(None),
        }
    }
}

pub struct FilterProcessor<S: DataSource, P> {
    predicate: P,
    _phantom: PhantomData<S>,
}

impl<S, P> DataProcessor for FilterProcessor<S, P>
where
    S: DataSource,
    P: Fn(&S::Item) -> bool,
{
    type Source = S;
    type Output = S::Item;

    fn process(&mut self, source: &mut Self::Source) -> Result<Option<Self::Output>, S::Error> {
        loop {
            match source.fetch_next()? {
                Some(item) if (self.predicate)(&item) => return Ok(Some(item)),
                Some(_) => continue,
                None => return Ok(None),
            }
        }
    }
}
