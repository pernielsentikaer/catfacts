import { ActionPanel, Action, Icon, List, showToast, Toast, getPreferenceValues } from "@raycast/api";
import { useEffect, useState } from "react";

const API_URL = "https://meowfacts.herokuapp.com/";
interface Preferences {
  factCount: string;
  language: string;
}

export default function Command() {
  const preferences = getPreferenceValues<Preferences>();
  const [data, setData] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    fetchFacts();
  }, []);

  function fetchFacts() {
    setIsLoading(true);
    const count = preferences.factCount ? parseInt(preferences.factCount) : 5;
    const lang = preferences.language;
    const url = API_URL + "?count=" + count + (lang ? "&lang=" + lang : "");
    fetch(url)
      .then((res) => res.json() as Promise<{ data: string[] }>)
      .then((json) => {
        setData(json.data);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        showToast({
          style: Toast.Style.Failure,
          title: "Failed to fetch cat facts",
          message: error.message,
        });
      });
  }

  const toggleFavorite = (fact: string) => {
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
        data.map((fact: string, idx: number) => {
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
