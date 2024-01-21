import { MigrationInterface, QueryRunner } from "typeorm";

export class TorrentFileTree1705756646294 implements MigrationInterface {
  name = "TorrentFileTree1705756646294";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "magnet_requests" ADD "tree" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "magnet_requests" DROP COLUMN "tree"`);
  }
}
