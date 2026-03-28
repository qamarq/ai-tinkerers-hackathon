CREATE TABLE "recipe_3d_tasks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "recipe_3d_tasks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"recipe_name" varchar(500) NOT NULL,
	"prompt" text NOT NULL,
	"meshy_task_id" varchar(255),
	"status" varchar(50) DEFAULT 'PENDING' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"model_url" varchar(1000),
	"meshy_model_url" varchar(1000),
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
