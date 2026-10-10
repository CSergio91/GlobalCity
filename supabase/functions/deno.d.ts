// Ambient type declarations for Supabase Edge Functions (Deno Runtime)
declare namespace Deno {
  function serve(handler: (req: Request) => Promise<Response> | Response): void;
  namespace env {
    function get(key: string): string | undefined;
    function set(key: string, value: string): void;
  }
}
