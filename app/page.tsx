import Hero from "./_components/Hero";
import Footer from "./_components/Footer";
import HomeSections from "./_components/HomeSections";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero/>
      <HomeSections />
      <Footer/>
    </div>
  );
}
