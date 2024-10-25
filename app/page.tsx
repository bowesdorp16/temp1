import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Dumbbell,
  Scale,
  Trophy,
  Target
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 w-full py-12 md:py-24 lg:py-32 xl:py-48 gradient-bg">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="flex items-center space-x-2">
              <Dumbbell className="h-12 w-12 text-primary icon-glow" />
              <h1 className="text-4xl font-bold gradient-text">BulkBlitz</h1>
            </div>
            
            <p className="mx-auto max-w-[700px] text-lg text-foreground md:text-xl">
              Your personalized companion for achieving serious muscle gains
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="font-semibold hover-glow">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 hover-glow">
                <Link href="/auth/signup">Start Building Muscle</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50 backdrop-blur-sm">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Scale className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Track Meals</h3>
              <p className="text-muted-foreground">
                Monitor your caloric surplus and protein intake for optimal muscle growth
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Smart Analysis</h3>
              <p className="text-muted-foreground">
                Get personalized bulking strategies based on your body type and goals
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Track Progress</h3>
              <p className="text-muted-foreground">
                Monitor your gains with advanced metrics and progress tracking
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}