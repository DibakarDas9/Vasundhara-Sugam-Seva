export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Simple steps to transform your food management and reduce waste.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Steps will be implemented here */}
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Add Items</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Scan barcodes or take photos to add food items to your inventory.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
