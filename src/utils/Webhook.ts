import axios, { AxiosError } from "axios";
import { STATUS } from "../entity/index.js";
import { logger } from "./logger.js";
import { WEBHOOK_URL } from "../config.js";

export class Webhook {
  private static axios() {
    const ax = axios.create();

    ax.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        logger.error(
          `WEBHOOKRESPONSE: request was not successfull url=${error?.config?.baseURL}${
            error?.config?.url
          } method=${
            error.request?._currentRequest?.method || error?.config?.method
          } message="${error?.message}"`,
        );
        console.log(JSON.stringify(error.response?.data));
        throw error;
      },
    );

    return ax;
  }

  public static async send(jobId: string, status: STATUS, message: string) {
    try {
      if (!WEBHOOK_URL) {
        return;
      }

      const url = new URL(WEBHOOK_URL);

      await this.axios().post(
        `${url.origin}${url.pathname}${url.search}`,
        { jobId, status, message },
        {
          auth: {
            username: url.username,
            password: url.password,
          },
        },
      );
    } catch (e) {
      logger.error(e);
    }
  }
}
