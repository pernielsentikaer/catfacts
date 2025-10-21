import { ActionPanel, Action, Icon, List, showToast, Toast, Color, getPreferenceValues } from "@raycast/api";
import { useEffect, useState } from "react";
import { useMemo } from "react";

let API_URL = "https://meowfacts.herokuapp.com/";
const MAX_RETRIES = 3;

interface Preferences {
  factCount: string;
  language: string;
}

export default function Command() {
  const preferences = getPreferenceValues<Preferences>();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    fetchFacts();
  }, []);

  function fetchFacts() {
    setIsLoading(true);
    const count = preferences.factCount ? parseInt(preferences.factCount) : 5;
    const lang = preferences.language;
    const url = API_URL + "?count=" + count + (lang ? "&lang=" + lang : "");
    fetch(url)
      .then((res) => res.json())
      .then((json: any) => {
        setData(json.data);
        setIsLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setIsLoading(false);
        showToast({
          style: Toast.Style.Failure,
          title: "Failed to fetch cat facts",
          message: error.message,
        });
      });
  }

  const toggleFavorite = (fact: any) => {
    if (favorites.includes(fact)) {
      setFavorites(favorites.filter((f) => f !== fact));
    } else {
      setFavorites([...favorites, fact]);
    }
  };

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search cat facts...">
      {!data && <List.EmptyView title="No facts" />}

      {data &&
        data.map((fact: any, idx: number) => {
          const isFav = favorites.includes(fact);
          return (
            <List.Item
              key={idx}
              icon="🐈"
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
