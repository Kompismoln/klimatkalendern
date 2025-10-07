export const getValueFromMeta = (name: string): string | null => {
  const element = document.querySelector(`meta[name="${name}"]`);
  if (element && element.getAttribute("content")) {
    return element.getAttribute("content");
  }
  return null;
};

export function escapeHtml(html: string) {
  const p = document.createElement("p");
  p.appendChild(document.createTextNode(html.trim()));

  const escapedContent = p.innerHTML;
  p.remove();

  return escapedContent;
}

export function getElementByXPath(path: string) {
  return new XPathEvaluator()
    .createExpression(path)
    .evaluate(document, XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue;
}
