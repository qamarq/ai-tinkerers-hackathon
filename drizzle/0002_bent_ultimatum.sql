CREATE TABLE "scale_measurements" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "scale_measurements_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"weight" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
