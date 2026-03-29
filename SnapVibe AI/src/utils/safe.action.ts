export const safeAction = async <T>(fn: () => Promise<T>) => {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error: any) {
    console.error("SAFE ACTION ERROR:", error);
    return {
      success: false,
      error: error?.message || "Something went wrong",
    };
  }
};