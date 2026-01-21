import React from "react";
import LibraryImport from "../components/LibraryImport";
import NovelList from "../components/NovelList";

const HomePage: React.FC = () => {
  return (
    <div className="space-y-8">
      <LibraryImport />
      <NovelList />
    </div>
  );
};

export default HomePage;
