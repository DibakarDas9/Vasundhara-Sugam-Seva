import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary-600 to-blue-600 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Ready to Start Your Journey?
        </h2>
        <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
          Join thousands of households already reducing food waste and saving money with Vasundhara.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="xl" variant="secondary" asChild className="group">
            <Link href="/register">
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          
          <Button size="xl" variant="outline" asChild className="text-white border-white hover:bg-white hover:text-primary-600">
            <Link href="/contact">
              Contact Sales
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
