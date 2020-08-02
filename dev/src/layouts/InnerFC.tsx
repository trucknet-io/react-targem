import { useLocale } from "@lib";
import React from "react";

const InnerFC: React.FC = () => {
  const { t, locale, direction, tnf } = useLocale();

  return (
    <>
      <h1>
        {t("Current locale")}: <span style={{ color: "green" }}>{locale}</span>{" "}
        | <i>{direction}</i>
      </h1>
      <h3>
        tnf() usage:{" "}
        {tnf(
          "There is {{ count }} button",
          "There are {{ count }} buttons",
          20000,
        )}
      </h3>
    </>
  );
};

export default InnerFC;
