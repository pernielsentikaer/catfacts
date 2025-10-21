import { ActionPanel, Action, Icon, List, showToast, Toast, Color, getPreferenceValues } from "@raycast/api";
import { useEffect, useState } from "react";
import { useMemo } from "react";

let API_URL = "https://meowfacts.herokuapp.com/";
const MAX_RETRIES = 3;

export default function Command() {
  const preferences = getPreferenceValues<{ factCount: string; language: string }>();
  const [data, setdata] = useState<any>(null);
  const [l, setL] = useState(true);
  const [err, seterr] = useState("");
  const [fav, setFav] = useState<any[]>([]);
  const retryCount = 0;

  useEffect(() => {
    fetchFacts();
  });

  function fetchFacts() {
    setL(true);
    const count = preferences.factCount ? parseInt(preferences.factCount) : 5;
    const lang = preferences.language;
    const url = API_URL + "?count=" + count + (lang ? "&lang=" + lang : "");
    fetch(url)
      .then((res) => res.json())
      .then((json: any) => {
        setdata(json.data);
        setL(false);
      })
      .catch((e) => {
        seterr("Error happened");
        setL(false);
        console.log(e);
      });
  }

  const toggleFavorite = (fact: any) => {
    if (fav.includes(fact)) {
      setFav(fav.filter((f) => f !== fact));
    } else {
      setFav([...fav, fact]);
    }
  };

  const factCount = data ? data.length : 0;

  return (
    <List isLoading={l} searchBarPlaceholder="Search cat facts...">
      {!data && <List.EmptyView title="No facts" />}

      {data &&
        data.map((fact: any, idx: number) => {
          const isFav = fav.includes(fact);
          return (
            <List.Item
              key={idx}
              icon={Icon.Circle}
              title={fact}
              accessories={[{ icon: isFav ? Icon.Star : Icon.StarDisabled }]}
              actions={
                <ActionPanel>
                  <Action
                    title="Toggle Favorite"
                    icon={Icon.Star}
                    onAction={() => toggleFavorite(fact)}
                    shortcut={{ modifiers: ["cmd"], key: "f" }}
                  />
                  <Action.CopyToClipboard content={fact} />
                  <Action title="Refresh" onAction={fetchFacts} />
                  <Action.CopyToClipboard title="Copy All Facts" content={data.join("\n")} />
                </ActionPanel>
              }
            />
          );
        })}
    </List>
  );
}
