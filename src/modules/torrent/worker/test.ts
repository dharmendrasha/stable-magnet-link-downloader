import { SandboxedJob } from "bullmq";

export default async function SandBoxWork(job: SandboxedJob) {
  const data = job.data;
  console.log(data);

  return new Promise((res) => {
    setTimeout(() => {
      console.log("im finished");
      res(true);
    }, 5000);
  });
}
