export function TestimonialsSection() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            What Our Users Say
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Real stories from real people making a difference.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Testimonials will be implemented here */}
          <div className="card p-6">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              "Vasundhara has completely transformed how we manage our food. We've reduced waste by 60%!"
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full mr-3"></div>
              <div>
                <div className="font-semibold">Sarah Johnson</div>
                <div className="text-sm text-gray-500">Family of 4</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
