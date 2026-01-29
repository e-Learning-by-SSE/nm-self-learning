# Worker API

Shared Library to be used by `site` (as client) and `worker-service` (as server).

## How to define new Job

1. Write `schema` definitions, to define data types for data exchange in
   `libs/data-access/worker/src/lib/job-definitions`:
    - `payload`: A schema to define what data is send to the `worker-service`
    - Currently, there is no return type definition
    - Add them together with a unique `jobType`identifier to `SubmitJobInput`.
2. Write `JobDefinition` in `apps/worker-service/src/jobs`:
    - Name it as `<your-job-name>.job.ts
    - Add this to the `JobRegistry` of `apps/worker-service/src/jobs/index.ts`
    - Write tests
3. Writer `router` in `libs/data-access/api/` to receive user input from pages
   and forward this as a job request to the `worker-service`:
    - `import { workerServiceClient } from "@self-learning/worker-api";`
    - Generate unique `jobId` via `const jobId = crypto.randomUUID();`
    - Subscribe for events, via `workerServiceClient.jobQueue.subscribe`,
      which will send the following kind of notifications:
        - `ready`: Subscriber is attached, you may submit the job now
        - `queued`: Job is queued, but not processed
        - `started`: Computation will start now
        - `finished`: Computation finished, `result` is attached
        - `aborted`: Computation failed, `cause` is attached
    - Don't forget to unsubscribe on `finished`, `aborted` and
      caught `Error`s.
    - Log events as follows:
        ```
        import { logJobProgress } from "@self-learning/database";
        logJobProgress(jobId, data);
        ```
    - Submit your job, via `workerServiceClient.submitJob.mutate`
