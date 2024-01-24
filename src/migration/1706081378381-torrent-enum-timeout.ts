import { MigrationInterface, QueryRunner } from "typeorm";

export class TorrentEnumTimeout1706081378381 implements MigrationInterface {
  name = "TorrentEnumTimeout1706081378381";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."magnet_requests_status_enum" RENAME TO "magnet_requests_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."magnet_requests_status_enum" AS ENUM('in_progress', 'paused', 'failed', 'completed', 'noted', 'in_queue', 'timeout')`,
    );
    await queryRunner.query(
      `ALTER TABLE "magnet_requests" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "magnet_requests" ALTER COLUMN "status" TYPE "public"."magnet_requests_status_enum" USING "status"::"text"::"public"."magnet_requests_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "magnet_requests" ALTER COLUMN "status" SET DEFAULT 'noted'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."magnet_requests_status_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."magnet_requests_status_enum_old" AS ENUM('in_progress', 'paused', 'failed', 'completed', 'noted', 'in_queue')`,
    );
    await queryRunner.query(
      `ALTER TABLE "magnet_requests" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "magnet_requests" ALTER COLUMN "status" TYPE "public"."magnet_requests_status_enum_old" USING "status"::"text"::"public"."magnet_requests_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "magnet_requests" ALTER COLUMN "status" SET DEFAULT 'noted'`,
    );
    await queryRunner.query(`DROP TYPE "public"."magnet_requests_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."magnet_requests_status_enum_old" RENAME TO "magnet_requests_status_enum"`,
    );
  }
}
