export function StatsSection() {
  return (
    <section className="py-20 bg-primary-600 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Making a Real Impact
          </h2>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            Join thousands of users already making a difference in the fight against food waste.
          </p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-8">
          {/* Stats will be implemented here */}
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">10,000+</div>
            <div className="text-primary-100">Active Users</div>
          </div>
        </div>
      </div>
    </section>
  );
}
