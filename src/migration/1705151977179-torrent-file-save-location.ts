import { MigrationInterface, QueryRunner } from "typeorm";

export class TorrentFileSaveLocation1705151977179 implements MigrationInterface {
    name = 'TorrentFileSaveLocation1705151977179'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "magnet_requests" ALTER COLUMN "saved_location" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "magnet_requests" ALTER COLUMN "saved_location" SET NOT NULL`);
    }

}
