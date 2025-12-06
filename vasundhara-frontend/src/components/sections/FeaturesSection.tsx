export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful Features for Smart Food Management
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Everything you need to reduce food waste, save money, and live more sustainably.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature cards will be implemented here */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold mb-2">AI Predictions</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get accurate expiry predictions using machine learning.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
