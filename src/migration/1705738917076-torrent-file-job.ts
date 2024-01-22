import { MigrationInterface, QueryRunner } from "typeorm";

export class TorrentFileJob1705738917076 implements MigrationInterface {
  name = "TorrentFileJob1705738917076";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "magnet_requests" ADD "job_id" numeric`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "magnet_requests" DROP COLUMN "job_id"`,
    );
  }
}
