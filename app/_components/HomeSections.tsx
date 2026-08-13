import HomeSectionsBackground from "./HomeSectionsBackground";
import HomeSeparator from "./HomeSeparator";
import HowCodeQuestWorks from "./HowCodeQuestWorks";
import Leaderboard from "./Leaderboard";
import PlaygroundPromo from "./PlaygroundPromo";

export default function HomeSections() {
  return (
    <HomeSectionsBackground>
      <HomeSeparator />
      <HowCodeQuestWorks />
      <HomeSeparator />
      <Leaderboard />
      <HomeSeparator />
      <PlaygroundPromo />
    </HomeSectionsBackground>
  );
}
