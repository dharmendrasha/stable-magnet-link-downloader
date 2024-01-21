import { TorrentInfo } from "../modules/torrent/accept.js";
import { BaseEntity } from "./base.js";
import { Entity, Column } from "typeorm";

export enum STATUS {
  IN_PROGRESS = "in_progress",
  PAUSED = "paused",
  FAILED = "failed",
  completed = "completed",
  NOTED = "noted",
  IN_QUEUE = "in_queue",
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
  tree!: object | null;

  @Column({ type: "varchar", nullable: true })
  message!: string | null;
}
