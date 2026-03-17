"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getAccounts() {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching accounts:", error);
    return [];
  }
  
  return data;
}

export async function addAccount(formData: FormData) {
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const initialValue = parseFloat(formData.get("initialValue") as string);
  const owner = formData.get("owner") as string; 
  
  const isLiability = category.includes("Liabilitas");

  const { error } = await supabase
    .from("accounts")
    .insert([
      {
        name,
        category,
        current_balance: initialValue,
        is_liability: isLiability,
      }
    ]);

  if (error) {
    console.error("Error inserting account:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function updateAccountBalance(accountId: string, newBalance: number) {
  const { error } = await supabase
    .from("accounts")
    .update({ current_balance: newBalance })
    .eq("id", accountId);

  if (error) {
    console.error("Error updating account:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function getMonthlySnapshots() {
  const { data, error } = await supabase
    .from("monthly_snapshots")
    .select("*")
    .order("snapshot_date", { ascending: true });

  if (error) {
    console.error("Error fetching snapshots:", error);
    return [];
  }
  
  return data;
}

export async function seedHistoricalSnapshots(currentNetWorth: number) {
  // Generate 12 months of fake historical ascending data ending near currentNetWorth
  const snapshots = [];
  const today = new Date();
  
  const baseValue = currentNetWorth * 0.6; // Start at 60% of current net worth 12 months ago
  const growthStep = (currentNetWorth - baseValue) / 12;

  for (let i = 12; i > 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i + 1, 0); // Last day of that month
    const value = baseValue + (growthStep * (12 - i)) + (Math.random() * growthStep * 0.5); // Add some random variance
    
    snapshots.push({
      snapshot_date: d.toISOString().split('T')[0],
      total_assets: value * 1.1,
      total_liabilities: value * 0.1,
      net_worth: value,
      liquid_assets: value * 0.2,
      marketable_assets: value * 0.4,
      illiquid_assets: value * 0.5,
      liquid_marketable_wealth: value * 0.6
    });
  }

  const { error } = await supabase.from("monthly_snapshots").insert(snapshots);

  if (error) {
    console.error("Error seeding snapshots:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function deleteAccount(accountId: string) {
  const { error } = await supabase
    .from("accounts")
    .delete()
    .eq("id", accountId);

  if (error) {
    console.error("Error deleting account:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function getCashFlowCategories() {
  const { data, error } = await supabase
    .from("cash_flow_categories")
    .select("*")
    .order("grouping", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
  
  return data;
}

export async function getTransactions() {
  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      category:cash_flow_categories(name, grouping, is_essential),
      source:accounts!transactions_source_account_id_fkey(name),
      destination:accounts!transactions_destination_account_id_fkey(name)
    `)
    .order("transaction_date", { ascending: false });

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
  
  return data;
}

export async function addTransaction(formData: FormData) {
  const transaction_date = formData.get("transaction_date") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const description = formData.get("description") as string;
  const transaction_type = formData.get("transaction_type") as string;
  
  const source_account_id = formData.get("source_account_id") as string || null;
  const destination_account_id = formData.get("destination_account_id") as string || null;
  const category_id = formData.get("category_id") as string || null;
  const is_recurring = formData.get("is_recurring") === "true";

  const { error } = await supabase
    .from("transactions")
    .insert([
      {
        transaction_date,
        amount,
        description,
        transaction_type,
        source_account_id,
        destination_account_id,
        category_id,
        is_recurring
      }
    ]);

  if (error) {
    console.error("Error inserting transaction:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function deleteTransaction(transactionId: string) {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId);

  if (error) {
    console.error("Error deleting transaction:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function updateTransaction(transactionId: string, amount: number, description: string) {
  const { error } = await supabase
    .from("transactions")
    .update({ amount, description })
    .eq("id", transactionId);

  if (error) {
    console.error("Error updating transaction:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function getLatestSnapshot() {
  const { data, error } = await supabase
    .from("monthly_snapshots")
    .select("*")
    .order("snapshot_date", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // Ignore row not found error
    console.error("Error fetching latest snapshot:", error);
    return null;
  }
  
  return data;
}

export async function getTransactionsSince(dateString?: string) {
  let query = supabase
    .from("transactions")
    .select(`
      *,
      category:cash_flow_categories(name, grouping, is_essential),
      source:accounts!transactions_source_account_id_fkey(name),
      destination:accounts!transactions_destination_account_id_fkey(name)
    `)
    .order("transaction_date", { ascending: false });
    
  if (dateString) {
    query = query.gt("transaction_date", dateString);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
  
  return data;
}

export async function closeMonth() {
  const today = new Date();
  
  // Get all accounts to compute snapshot values
  const { data: accountsData, error: accError } = await supabase.from('accounts').select('*');
  if (accError || !accountsData) return { success: false, error: "Failed to grab accounts for snapshot" };

  let total_assets = 0;
  let total_liabilities = 0;
  let liquid_assets = 0;
  let marketable_assets = 0;
  let illiquid_assets = 0;

  accountsData.forEach(a => {
    const bal = Number(a.current_balance) || 0;
    if (a.is_liability) {
      total_liabilities += bal;
    } else {
      total_assets += bal;
      const cat = a.category.toLowerCase();
      if (cat.includes("kas") || cat.includes("tabungan") || cat.includes("deposito") || cat.includes("e-wallet") || cat.includes("valuta") || cat.includes("tier 1")) {
        liquid_assets += bal;
      } else if (cat.includes("reksadana") || cat.includes("saham") || cat.includes("sbn") || cat.includes("obligasi") || cat.includes("kripto") || cat.includes("p2p") || cat.includes("tier 2")) {
        marketable_assets += bal;
      } else {
        illiquid_assets += bal;
      }
    }
  });

  const net_worth = total_assets - total_liabilities;
  const liquid_marketable_wealth = liquid_assets + marketable_assets;

  // 1. Create Snapshot (Last day of current month roughly, or just today's date)
  const snapshot_date = today.toISOString().split('T')[0];
  const { error: snapError } = await supabase.from('monthly_snapshots').insert([{
    snapshot_date,
    total_assets,
    total_liabilities,
    net_worth,
    liquid_assets,
    marketable_assets,
    illiquid_assets,
    liquid_marketable_wealth
  }]);

  if (snapError) {
    if (snapError.code === '23505') {
       return { success: false, error: "Snapshot for this date already exists." };
    }
    return { success: false, error: snapError.message };
  }

  // 2. Lock unlocked transactions
  const { error: lockError } = await supabase
    .from('transactions')
    .update({ is_locked: true })
    .eq('is_locked', false);

  if (lockError) return { success: false, error: "Snapshot generated, but failed to lock transactions." };

  revalidatePath("/");
  return { success: true };
}
