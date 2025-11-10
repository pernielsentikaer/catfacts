import { ActionPanel, Action, Icon, List, showToast, Toast, getPreferenceValues, LocalStorage } from "@raycast/api";
import { useEffect, useState } from "react";
import { useCatFacts } from "./hooks/useCatFacts";
interface Preferences {
  factCount: string;
  language: string;
}

export default function Command() {
  const preferences = getPreferenceValues<Preferences>();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  const count = preferences.factCount ? parseInt(preferences.factCount) : 5;
  const lang = preferences.language;
  const { data, isLoading, revalidate, error } = useCatFacts(count, lang);

  // Validate preferences
  const isValidCount = count > 0 && count <= 50;
  const hasValidPreferences = isValidCount;

  // Load favorites from storage on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await LocalStorage.getItem<string>("cat-facts-favorites");
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
    }
  };

  const saveFavorites = async (newFavorites: string[]) => {
    try {
      await LocalStorage.setItem("cat-facts-favorites", JSON.stringify(newFavorites));
    } catch (error) {
      console.error("Failed to save favorites:", error);
    }
  };

  const toggleFavorite = (fact: string) => {
    const newFavorites = favorites.includes(fact) ? favorites.filter((f) => f !== fact) : [...favorites, fact];

    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  const removeFavorite = (fact: string) => {
    const newFavorites = favorites.filter((f) => f !== fact);
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  const clearAllFavorites = () => {
    setFavorites([]);
    saveFavorites([]);
    showToast({
      style: Toast.Style.Success,
      title: "All favorites cleared",
    });
  };

  // Show error toast for API failures
  useEffect(() => {
    if (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to fetch cat facts",
        message: error.message || "Check your internet connection and try again",
      });
    }
  }, [error]);

  // Show warning toast for invalid preferences
  useEffect(() => {
    if (!hasValidPreferences) {
      showToast({
        style: Toast.Style.Failure,
        title: "Invalid preferences",
        message: "Fact count must be between 1 and 50. Check your extension preferences.",
      });
    }
  }, [hasValidPreferences]);

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search cat facts...">
      {/* Toggle between facts and favorites */}
      <List.Item
        icon={showFavorites ? Icon.List : Icon.Star}
        title={showFavorites ? "Show Cat Facts" : `Show Favorites (${favorites.length})`}
        actions={
          <ActionPanel>
            <Action
              title={showFavorites ? "Show Cat Facts" : "Show Favorites"}
              icon={showFavorites ? Icon.List : Icon.Star}
              onAction={() => setShowFavorites(!showFavorites)}
              shortcut={{ modifiers: ["cmd"], key: "t" }}
            />
          </ActionPanel>
        }
      />

      {showFavorites ? (
        // Favorites section
        <>
          {favorites.length === 0 ? (
            <List.EmptyView
              title="No Favorites Yet"
              description="Star some cat facts to add them to your favorites! Switch to 'Cat Facts' view to start collecting."
              icon="⭐"
              actions={
                <ActionPanel>
                  <Action
                    title="Show Cat Facts"
                    onAction={() => setShowFavorites(false)}
                    icon={Icon.List}
                    shortcut={{ modifiers: ["cmd"], key: "t" }}
                  />
                </ActionPanel>
              }
            />
          ) : (
            <>
              <List.Item
                icon={Icon.Trash}
                title="Clear All Favorites"
                accessories={[{ text: `${favorites.length} items` }]}
                actions={
                  <ActionPanel>
                    <Action
                      title="Clear All Favorites"
                      icon={Icon.Trash}
                      style={Action.Style.Destructive}
                      onAction={clearAllFavorites}
                      shortcut={{ modifiers: ["cmd", "shift"], key: "delete" }}
                    />
                  </ActionPanel>
                }
              />
              {favorites.map((fact: string, idx: number) => (
                <List.Item
                  key={`fav-${idx}`}
                  icon="⭐"
                  title={fact}
                  actions={
                    <ActionPanel>
                      <Action
                        title="Remove from Favorites"
                        icon={Icon.StarDisabled}
                        onAction={() => removeFavorite(fact)}
                        shortcut={{ modifiers: ["cmd"], key: "f" }}
                      />
                      <Action.CopyToClipboard content={fact} />
                      <Action.CopyToClipboard title="Copy All Favorites" content={favorites.join("\n")} />
                    </ActionPanel>
                  }
                />
              ))}
            </>
          )}
        </>
      ) : (
        // Regular cat facts section
        <>
          {!hasValidPreferences ? (
            <List.EmptyView
              title="Invalid Preferences"
              description="Please check your extension preferences. Fact count must be between 1 and 50."
              icon="⚠️"
            />
          ) : error ? (
            <List.EmptyView
              title="Connection Error"
              description="Unable to fetch cat facts. Check your internet connection and try again."
              icon="🌐"
              actions={
                <ActionPanel>
                  <Action title="Retry" onAction={revalidate} icon={Icon.ArrowClockwise} />
                </ActionPanel>
              }
            />
          ) : !data || data.length === 0 ? (
            <List.EmptyView
              title="No Cat Facts Available"
              description="The API returned no facts. Try refreshing or check back later."
              icon="🐈"
              actions={
                <ActionPanel>
                  <Action title="Refresh" onAction={revalidate} icon={Icon.ArrowClockwise} />
                </ActionPanel>
              }
            />
          ) : null}
          {data &&
            data.length > 0 &&
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
                        title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                        icon={isFav ? Icon.StarDisabled : Icon.Star}
                        onAction={() => toggleFavorite(fact)}
                        shortcut={{ modifiers: ["cmd"], key: "f" }}
                      />
                      <Action.CopyToClipboard content={fact} />
                      <Action title="Refresh" onAction={revalidate} />
                      <Action.CopyToClipboard title="Copy All Facts" content={data.join("\n")} />
                    </ActionPanel>
                  }
                />
              );
            })}
        </>
      )}
    </List>
  );
}
