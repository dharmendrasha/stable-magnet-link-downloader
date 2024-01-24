import { TorrentInfo } from "../modules/torrent/accept.js";
import { BaseEntity } from "./base.js";
import { Entity, Column } from "typeorm";

export enum STATUS {
  /**
   * if the job is in the queue and downloading files
   */
  IN_PROGRESS = "in_progress",
  /**
   * if the job is paused by the user or the service
   */
  PAUSED = "paused",
  /**
   * if the job is failed by the service by timedout
   */
  FAILED = "failed",
  /**
   * if the job is completed by user
   */
  COMPLETED = "completed",
  /**
   * if accepted by the service
   */
  NOTED = "noted",
  /**
   * if it is added to the queue waiting list
   */
  IN_QUEUE = "in_queue",
  /**
   * if it is timedout
   */
  TIMEDOUT = "timeout",
}

@Entity({ name: "magnet_requests" })
export class MagnetRequests extends BaseEntity {
  @Column({ type: "text" })
  link!: string;

  @Column({ type: "varchar", unique: true })
  hash!: string;

  @Column({ type: "enum", enum: STATUS, default: STATUS.NOTED })
  status!: STATUS;

  @Column({ type: "varchar", length: 300 })
  name!: string;

  // -1 means unindentified
  @Column({ type: "numeric" })
  size!: number;

  @Column({ type: "text", nullable: true })
  saved_location!: string | null;

  @Column({ type: "jsonb" })
  info!: TorrentInfo;

  @Column({ type: "numeric", nullable: true })
  job_id!: string | null;

  @Column({ type: "jsonb", nullable: true })
  tree!: unknown;

  @Column({ type: "varchar", nullable: true })
  message!: string | null;
}
