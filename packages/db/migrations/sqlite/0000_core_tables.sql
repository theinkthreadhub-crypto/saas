CREATE TABLE `companies` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`name` text NOT NULL,
	`gstin` text,
	`state_code` text NOT NULL,
	`address` text,
	`phone` text,
	`logo_url` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `companies_tenant_idx` ON `companies` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "tenants_status_chk" CHECK(status IN ('active', 'inactive', 'suspended'))
);
--> statement-breakpoint
CREATE INDEX `tenants_status_idx` ON `tenants` (`status`);--> statement-breakpoint
CREATE TABLE `devices` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`company_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`outlet_id` text NOT NULL,
	`name` text NOT NULL,
	`series` text NOT NULL,
	`app_version` text,
	`last_seen_at` integer,
	`status` text DEFAULT 'active' NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "devices_status_chk" CHECK(status IN ('active', 'inactive', 'suspended'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `devices_series_uq` ON `devices` (`company_id`,`series`);--> statement-breakpoint
CREATE TABLE `outlets` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`company_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "outlets_status_chk" CHECK(status IN ('active', 'inactive', 'suspended'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `outlets_code_uq` ON `outlets` (`company_id`,`code`);--> statement-breakpoint
CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`permissions` text NOT NULL,
	`is_system` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roles_name_uq` ON `roles` (`tenant_id`,`name`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`login_id` text NOT NULL,
	`name` text NOT NULL,
	`role_id` text NOT NULL,
	`password_hash` text,
	`pin_hash` text,
	`must_change_password` integer DEFAULT false NOT NULL,
	`last_login_at` integer,
	`status` text DEFAULT 'active' NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "users_status_chk" CHECK(status IN ('active', 'inactive', 'suspended'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_login_uq` ON `users` (`login_id`);--> statement-breakpoint
CREATE INDEX `users_tenant_idx` ON `users` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `godowns` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`company_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`outlet_id` text,
	`name` text NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `godowns_name_uq` ON `godowns` (`company_id`,`name`);--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`company_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`code` text,
	`barcode` text,
	`hsn` text,
	`unit_id` text NOT NULL,
	`gst_rate_bp` integer DEFAULT 0 NOT NULL,
	`sale_rate` integer DEFAULT 0 NOT NULL,
	`purchase_rate` integer DEFAULT 0 NOT NULL,
	`mrp` integer,
	`low_stock_milli` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`attributes` text,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "items_gst_rate_chk" CHECK(gst_rate_bp BETWEEN 0 AND 10000)
);
--> statement-breakpoint
CREATE INDEX `items_company_name_idx` ON `items` (`company_id`,`name`);--> statement-breakpoint
CREATE INDEX `items_barcode_idx` ON `items` (`company_id`,`barcode`);--> statement-breakpoint
CREATE TABLE `ledgers` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`company_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`group` text NOT NULL,
	`is_system` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "ledgers_group_chk" CHECK("group" IN ('cash', 'bank', 'sales', 'purchase', 'debtors', 'creditors', 'duties_taxes', 'round_off', 'direct_expense', 'indirect_expense', 'direct_income', 'indirect_income', 'capital', 'loans', 'fixed_assets', 'current_assets', 'current_liabilities', 'stock'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ledgers_name_uq` ON `ledgers` (`company_id`,`name`);--> statement-breakpoint
CREATE TABLE `parties` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`company_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`mobile` text,
	`gstin` text,
	`state_code` text,
	`address` text,
	`ledger_id` text NOT NULL,
	`credit_limit` integer,
	`attributes` text,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ledger_id`) REFERENCES `ledgers`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "parties_kind_chk" CHECK(kind IN ('customer', 'supplier', 'both'))
);
--> statement-breakpoint
CREATE INDEX `parties_company_name_idx` ON `parties` (`company_id`,`name`);--> statement-breakpoint
CREATE INDEX `parties_mobile_idx` ON `parties` (`company_id`,`mobile`);--> statement-breakpoint
CREATE TABLE `units` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`company_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`symbol` text NOT NULL,
	`decimals` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "units_decimals_chk" CHECK(decimals BETWEEN 0 AND 3)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `units_symbol_uq` ON `units` (`company_id`,`symbol`);--> statement-breakpoint
CREATE TABLE `bill_series` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`company_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`outlet_id` text,
	`device_id` text,
	`fin_year` text NOT NULL,
	`series` text NOT NULL,
	`next_no` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "bill_series_next_chk" CHECK(next_no >= 1)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bill_series_uq` ON `bill_series` (`company_id`,`fin_year`,`series`);--> statement-breakpoint
CREATE TABLE `ledger_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`company_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`voucher_id` text NOT NULL,
	`ledger_id` text NOT NULL,
	`date` text NOT NULL,
	`debit` integer DEFAULT 0 NOT NULL,
	`credit` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`voucher_id`) REFERENCES `vouchers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ledger_id`) REFERENCES `ledgers`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "ledger_entries_side_chk" CHECK(debit >= 0 AND credit >= 0 AND (debit = 0 OR credit = 0) AND debit + credit > 0)
);
--> statement-breakpoint
CREATE INDEX `ledger_entries_ledger_idx` ON `ledger_entries` (`company_id`,`ledger_id`,`date`);--> statement-breakpoint
CREATE INDEX `ledger_entries_voucher_idx` ON `ledger_entries` (`voucher_id`);--> statement-breakpoint
CREATE TABLE `stock_moves` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`company_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`voucher_id` text NOT NULL,
	`voucher_item_id` text,
	`item_id` text NOT NULL,
	`godown_id` text NOT NULL,
	`date` text NOT NULL,
	`qty_milli` integer NOT NULL,
	`rate` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`voucher_id`) REFERENCES `vouchers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`voucher_item_id`) REFERENCES `voucher_items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`godown_id`) REFERENCES `godowns`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "stock_moves_qty_chk" CHECK(qty_milli <> 0)
);
--> statement-breakpoint
CREATE INDEX `stock_moves_item_idx` ON `stock_moves` (`company_id`,`item_id`,`godown_id`);--> statement-breakpoint
CREATE INDEX `stock_moves_voucher_idx` ON `stock_moves` (`voucher_id`);--> statement-breakpoint
CREATE TABLE `voucher_items` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`company_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`voucher_id` text NOT NULL,
	`line_no` integer NOT NULL,
	`item_id` text NOT NULL,
	`unit_id` text,
	`godown_id` text,
	`hsn` text,
	`qty_milli` integer NOT NULL,
	`rate` integer NOT NULL,
	`discount` integer DEFAULT 0 NOT NULL,
	`taxable` integer NOT NULL,
	`gst_rate_bp` integer DEFAULT 0 NOT NULL,
	`cgst` integer DEFAULT 0 NOT NULL,
	`sgst` integer DEFAULT 0 NOT NULL,
	`igst` integer DEFAULT 0 NOT NULL,
	`total` integer NOT NULL,
	`attributes` text,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`voucher_id`) REFERENCES `vouchers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`godown_id`) REFERENCES `godowns`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `voucher_items_line_uq` ON `voucher_items` (`voucher_id`,`line_no`);--> statement-breakpoint
CREATE INDEX `voucher_items_item_idx` ON `voucher_items` (`item_id`);--> statement-breakpoint
CREATE TABLE `vouchers` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`company_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`outlet_id` text NOT NULL,
	`device_id` text NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`date` text NOT NULL,
	`fin_year` text NOT NULL,
	`series` text NOT NULL,
	`bill_no` integer NOT NULL,
	`party_id` text,
	`place_of_supply` text,
	`is_inter_state` integer DEFAULT false NOT NULL,
	`discount` integer DEFAULT 0 NOT NULL,
	`taxable` integer DEFAULT 0 NOT NULL,
	`cgst` integer DEFAULT 0 NOT NULL,
	`sgst` integer DEFAULT 0 NOT NULL,
	`igst` integer DEFAULT 0 NOT NULL,
	`round_off` integer DEFAULT 0 NOT NULL,
	`total` integer DEFAULT 0 NOT NULL,
	`narration` text,
	`ref_voucher_id` text,
	`cancel_reason` text,
	`cancelled_at` integer,
	`cancelled_by` text,
	`created_by` text,
	`attributes` text,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`outlet_id`) REFERENCES `outlets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`party_id`) REFERENCES `parties`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cancelled_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "vouchers_type_chk" CHECK(type IN ('sale', 'sale_return', 'purchase', 'purchase_return', 'receipt', 'payment', 'journal', 'contra', 'stock_transfer')),
	CONSTRAINT "vouchers_status_chk" CHECK(status IN ('active', 'cancelled')),
	CONSTRAINT "vouchers_cancel_chk" CHECK((status = 'cancelled' AND cancel_reason IS NOT NULL AND cancelled_at IS NOT NULL) OR status <> 'cancelled')
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vouchers_bill_no_uq` ON `vouchers` (`company_id`,`fin_year`,`series`,`bill_no`);--> statement-breakpoint
CREATE INDEX `vouchers_company_date_idx` ON `vouchers` (`company_id`,`date`);--> statement-breakpoint
CREATE INDEX `vouchers_party_idx` ON `vouchers` (`party_id`);--> statement-breakpoint
CREATE TABLE `activity_log` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`company_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`user_id` text,
	`device_id` text,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "activity_log_kind_chk" CHECK(kind IN ('screen', 'click'))
);
--> statement-breakpoint
CREATE INDEX `activity_log_company_time_idx` ON `activity_log` (`company_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`company_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`user_id` text,
	`device_id` text,
	`entity` text NOT NULL,
	`entity_id` text NOT NULL,
	`action` text NOT NULL,
	`reason` text,
	`diff` text,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `audit_log_entity_idx` ON `audit_log` (`entity`,`entity_id`);--> statement-breakpoint
CREATE INDEX `audit_log_company_time_idx` ON `audit_log` (`company_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `outbox` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`company_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`device_id` text,
	`entity` text NOT NULL,
	`entity_id` text NOT NULL,
	`op` text NOT NULL,
	`payload` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_error` text,
	`synced_at` integer,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "outbox_op_chk" CHECK(op IN ('insert', 'update')),
	CONSTRAINT "outbox_status_chk" CHECK(status IN ('pending', 'synced', 'failed'))
);
--> statement-breakpoint
CREATE INDEX `outbox_status_idx` ON `outbox` (`status`,`created_at`);