import { MigrationInterface, QueryRunner } from "typeorm";

export class TorrentFile1705147192801 implements MigrationInterface {
    name = 'TorrentFile1705147192801'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "magnet_requests" ADD "info" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "magnet_requests" DROP CONSTRAINT "PK_33522e55793250fe7c68611d50b"`);
        await queryRunner.query(`ALTER TABLE "magnet_requests" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "magnet_requests" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "magnet_requests" ADD CONSTRAINT "PK_33522e55793250fe7c68611d50b" PRIMARY KEY ("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "magnet_requests" DROP CONSTRAINT "PK_33522e55793250fe7c68611d50b"`);
        await queryRunner.query(`ALTER TABLE "magnet_requests" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "magnet_requests" ADD "id" BIGSERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "magnet_requests" ADD CONSTRAINT "PK_33522e55793250fe7c68611d50b" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "magnet_requests" DROP COLUMN "info"`);
    }

}
