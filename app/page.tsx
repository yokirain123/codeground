import Hero from "./_components/Hero";
import Footer from "./_components/Footer";
import HowCodeQuestWorks from "./_components/HowCodeQuestWorks";
import PlaygroundPromo from "./_components/PlaygroundPromo";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero/>
      <HowCodeQuestWorks/>
      <PlaygroundPromo/>
      <Footer/>
    </div>
  );
}
