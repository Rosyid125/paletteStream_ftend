import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PenTool, BookOpen, BookMarked } from "lucide-react";

const Home = () => {
  return (
    <main className="flex-1 p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Tabs defaultValue="illustrations" className="mt-6">
          <TabsList>
            <TabsTrigger value="illustrations">Illustrations</TabsTrigger>
            <TabsTrigger value="mangas">Mangas</TabsTrigger>
            <TabsTrigger value="novels">Novels</TabsTrigger>
          </TabsList>
          <TabsContent value="illustrations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="h-5 w-5" />
                  Illustrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>User's illustrations will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="mangas">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Mangas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>User's mangas will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="novels">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookMarked className="h-5 w-5" />
                  Novels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>User's novels will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default Home;
