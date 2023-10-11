import { Chain } from "@wagmi/core";
import {
  MetaMaskConnector,
  type MetaMaskConnectorOptions,
} from "@wagmi/core/connectors/metaMask";
import { WalletResult } from "../../type";
import { WalletConnectConnector } from "@wagmi/core/connectors/walletConnect";
import { getWalletConnectUri } from "../../../helpers/getWalletConnectUri";
import { isMetaMask } from "../../../helpers/wallet";
import { isAndroid, isMobile } from "../../../helpers/browser";
import logo from "./logo";

export interface MetaMaskWalletOptions {
  projectId: string;
  chains: Chain[];
  walletConnectOptions?: Omit<WalletConnectConnector["options"], "projectId">;
}

export const metaMaskWallet = ({
  chains,
  projectId,
  ...options
}: MetaMaskWalletOptions & MetaMaskConnectorOptions): WalletResult => {
  const isMetaMaskInjected =
    typeof window !== "undefined" &&
    typeof window.ethereum !== "undefined" &&
    (window.ethereum.providers?.some(isMetaMask) || window.ethereum.isMetaMask);

  const walletConnector = new WalletConnectConnector({
    chains,
    options: {
      projectId,
      showQrModal: false,
      ...options?.walletConnectOptions,
    },
  });

  const getUri = async () => {
    const uri = await getWalletConnectUri(walletConnector);
    return isMobile()
      ? isAndroid()
        ? uri
        : `https://metamask.app.link/wc?uri=${encodeURIComponent(uri)}`
      : uri;
  };

  return {
    id: "metaMask",
    name: "MetaMask",
    mobileName: "MetaMask Mobile",
    logo,
    installed: isMetaMaskInjected,
    downloadUrls: {
      android: "https://play.google.com/store/apps/details?id=io.metamask",
      ios: "https://apps.apple.com/us/app/metamask/id1438144202",
      chrome:
        "https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn",
      edge: "https://microsoftedge.microsoft.com/addons/detail/metamask/ejbalbakoplchlghecdalmeeeajnimhm",
      firefox: "https://addons.mozilla.org/firefox/addon/ether-metamask",
    },
    connector: {
      browser: new MetaMaskConnector({
        chains,
        options: {
          shimDisconnect: true,
          UNSTABLE_shimOnConnectSelectAccount: true,
          ...options,
        },
      }),
      qrCode: { getUri, connector: walletConnector },
      mobile: { getUri, connector: walletConnector },
    },
  };
};
