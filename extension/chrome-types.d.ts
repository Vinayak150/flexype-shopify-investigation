/**
 * Minimal Chrome Extension API typings for extension/ hosting layer only.
 */
declare namespace chrome {
  namespace runtime {
    const id: string;
    const lastError: { message?: string } | undefined;

    const onInstalled: {
      addListener(callback: () => void): void;
    };

    const onMessage: {
      addListener(
        callback: (
          message: unknown,
          sender: MessageSender,
          sendResponse: (response?: unknown) => void,
        ) => boolean | void,
      ): void;
    };

    interface MessageSender {
      tab?: tabs.Tab;
    }
  }

  namespace tabs {
    interface Tab {
      id?: number;
      url?: string;
      active?: boolean;
      title?: string;
    }

    function query(
      queryInfo: { active?: boolean; currentWindow?: boolean },
      callback: (tabs: Tab[]) => void,
    ): void;

    function sendMessage(
      tabId: number,
      message: unknown,
      responseCallback: (response: unknown) => void,
    ): void;
  }

  namespace action {
    const onClicked: {
      addListener(callback: () => void): void;
    };
  }
}
