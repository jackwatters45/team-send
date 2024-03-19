interface useFormatDateGroupReturn {
  date: string;
  time: string;
}
const formatRelativeDateAndTime = (
  dateInput: string | Date,
): useFormatDateGroupReturn => {
  const now = new Date();
  const date = new Date(dateInput);

  const diff = now.getTime() - date.getTime();

  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  let currentDate: string;
  if (diffDays === 0) {
    currentDate = "Today";
  } else if (diffDays === 1) {
    currentDate = "Yesterday";
  } else if (diffDays < 7) {
    currentDate = date.toLocaleDateString("en-US", { weekday: "long" });
  } else {
    currentDate =
      date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }) + " at";
  }

  const time = date.toLocaleTimeString([], {
    hour12: false,
    hour: "numeric",
    minute: "2-digit",
  });

  return { date: currentDate, time };
};

const formatShortRelativeDate = (dateInput: string | Date): string => {
  const today = new Date();
  const date = new Date(dateInput);

  let formattedDate: string;
  const oneDay = 24 * 60 * 60 * 1000;
  const daysDifference = Math.floor(
    (today.getTime() - date.getTime()) / oneDay,
  );

  if (daysDifference < 1 && today.getDate() === date.getDate()) {
    formattedDate = date.toLocaleTimeString([], {
      hour12: false,
      hour: "numeric",
      minute: "2-digit",
    });
  } else if (daysDifference < 7 && today.getDay() !== date.getDay()) {
    formattedDate = date.toLocaleDateString([], { weekday: "long" });
  } else {
    formattedDate = date.toLocaleDateString([], {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
  }

  return formattedDate;
};

export { formatRelativeDateAndTime, formatShortRelativeDate };
