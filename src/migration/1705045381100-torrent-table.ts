import { MigrationInterface, QueryRunner } from "typeorm";

export class TorrentTable1705045381100 implements MigrationInterface {
  name = "TorrentTable1705045381100";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."magnet_requests_status_enum" AS ENUM('in_progress', 'paused', 'failed', 'completed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "magnet_requests" ("id" BIGSERIAL NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "internal_comment" character varying(300), "is_verified" boolean NOT NULL DEFAULT false, "link" text NOT NULL, "status" "public"."magnet_requests_status_enum" NOT NULL DEFAULT 'in_progress', "name" character varying(300) NOT NULL, "size" numeric NOT NULL, "saved_location" text NOT NULL, CONSTRAINT "PK_33522e55793250fe7c68611d50b" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "magnet_requests"`);
    await queryRunner.query(`DROP TYPE "public"."magnet_requests_status_enum"`);
  }
}
