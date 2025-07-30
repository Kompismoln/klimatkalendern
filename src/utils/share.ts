import { reactive } from "vue";

export const twitterShareUrl = (
  url: string | undefined,
  text: string | undefined
): string | undefined => {
  if (!url || !text) return undefined;
  return `https://twitter.com/intent/tweet?url=${encodeURIComponent(
    url
  )}&text=${text}`;
};

export const facebookShareUrl = (
  url: string | undefined
): string | undefined => {
  if (!url) return undefined;
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    url
  )}`;
};

export const linkedInShareUrl = (
  url: string | undefined,
  text: string | undefined
): string | undefined => {
  if (!url || !text) return undefined;
  return `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
    url
  )}&title=${text}`;
};

export const whatsAppShareUrl = (
  url: string | undefined,
  text: string | undefined
): string | undefined => {
  if (!url || !text) return undefined;
  return `https://wa.me/?text=${encodeURIComponent(
    basicTextToEncode(url, text)
  )}`;
};

export const telegramShareUrl = (
  url: string | undefined,
  text: string | undefined
): string | undefined => {
  if (!url || !text) return undefined;
  return `https://t.me/share/url?url=${encodeURIComponent(
    url
  )}&text=${encodeURIComponent(text)}`;
};

export const emailShareUrl = (
  url: string | undefined,
  text: string | undefined
): string | undefined => {
  if (!url || !text) return undefined;
  return `mailto:?to=&body=${url}&subject=${text}`;
};

export const diasporaShareUrl = (
  url: string | undefined,
  text: string | undefined
): string | undefined => {
  if (!url || !text) return undefined;
  return `https://share.diasporafoundation.org/?title=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(url)}`;
};

export const mastodonShareUrl = (
  url: string | undefined,
  text: string | undefined
): string | undefined => {
  if (!url || !text) return undefined;
  return `https://toot.kytta.dev/?text=${encodeURIComponent(
    basicTextToEncode(url, text)
  )}`;
};

export const showCopiedTooltip = reactive({ ics: false, atom: false });

export const initCopiedTooltipShow = (): void => {
  showCopiedTooltip.ics = false;
  showCopiedTooltip.atom = false;
};

export const tokenToURL = (subURL: string): string => {
  return `${window.location.origin}/${subURL}`;
};

export const copyURL = (
  e: Event,
  url: string,
  format: "ics" | "atom"
): void => {
  if (navigator.clipboard) {
    e.preventDefault();
    navigator.clipboard.writeText(url);
    showCopiedTooltip[format] = true;
    setTimeout(() => {
      showCopiedTooltip[format] = false;
    }, 2000);
  }
};

const basicTextToEncode = (url: string, text: string): string => {
  return `${text}\r\n${url}`;
};
