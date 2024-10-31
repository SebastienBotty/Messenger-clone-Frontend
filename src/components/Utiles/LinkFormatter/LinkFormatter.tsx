export function LinkFormatter({ text }: { text: string }) {
  const urlRegex =
    /\b((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/\S*)?)\b/g;

  const parts = text.split(urlRegex).map((part, index) => {
    if (urlRegex.test(part)) {
      const url = part.startsWith("http") ? part : `http://${part}`;
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "white" }}
        >
          {part}
        </a>
      );
    }
    return part;
  });

  return <>{parts}</>;
}
