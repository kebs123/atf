declare module "africastalking" {
  interface SmsOptions {
    to: string | string[];
    message: string;
    from?: string;
  }

  interface AfricaTalkingClient {
    SMS: {
      send: (options: SmsOptions) => Promise<unknown>;
    };
  }

  interface AfricaTalkingConfig {
    apiKey: string;
    username: string;
  }

  function africastalking(config: AfricaTalkingConfig): AfricaTalkingClient;

  export = africastalking;
}
