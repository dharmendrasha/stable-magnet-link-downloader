import { MigrationInterface, QueryRunner } from "typeorm";

export class TorrentFileHash1705151258643 implements MigrationInterface {
  name = "TorrentFileHash1705151258643";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "magnet_requests" ADD "hash" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "magnet_requests" ADD CONSTRAINT "UQ_01580832a040571614bdfce18e9" UNIQUE ("hash")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "magnet_requests" DROP CONSTRAINT "UQ_01580832a040571614bdfce18e9"`,
    );
    await queryRunner.query(`ALTER TABLE "magnet_requests" DROP COLUMN "hash"`);
  }
}
