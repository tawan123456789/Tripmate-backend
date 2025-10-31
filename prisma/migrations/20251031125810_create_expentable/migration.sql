-- CreateTable
CREATE TABLE "public"."ExpenseGroup" (
    "expense_group_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "amount" DECIMAL(10,2),
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "ExpenseGroup_pkey" PRIMARY KEY ("expense_group_id")
);

-- CreateTable
CREATE TABLE "public"."ExpenseSpliter" (
    "expense_spliter_id" TEXT NOT NULL,
    "expense_group_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "ExpenseSpliter_pkey" PRIMARY KEY ("expense_spliter_id")
);

-- CreateIndex
CREATE INDEX "ExpenseGroup_group_id_idx" ON "public"."ExpenseGroup"("group_id");

-- CreateIndex
CREATE INDEX "ExpenseGroup_user_id_idx" ON "public"."ExpenseGroup"("user_id");

-- CreateIndex
CREATE INDEX "ExpenseSpliter_expense_group_id_idx" ON "public"."ExpenseSpliter"("expense_group_id");

-- CreateIndex
CREATE INDEX "ExpenseSpliter_user_id_idx" ON "public"."ExpenseSpliter"("user_id");

-- AddForeignKey
ALTER TABLE "public"."ExpenseGroup" ADD CONSTRAINT "ExpenseGroup_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."Group"("group_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExpenseGroup" ADD CONSTRAINT "ExpenseGroup_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExpenseSpliter" ADD CONSTRAINT "ExpenseSpliter_expense_group_id_fkey" FOREIGN KEY ("expense_group_id") REFERENCES "public"."ExpenseGroup"("expense_group_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExpenseSpliter" ADD CONSTRAINT "ExpenseSpliter_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
