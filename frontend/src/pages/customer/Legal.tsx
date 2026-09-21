import { useLocation } from 'react-router-dom';

export default function Legal() {
  const location = useLocation();
  const isPrivacy = location.pathname.includes('privacy');

  return (
    <div className="py-8 max-w-4xl mx-auto px-4 space-y-8">
      <div>
        <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
          Compliance & Consumer Protection
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-1">
          {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
        </h1>
        <p className="text-xs text-gray-400 mt-1">Last Updated: September 2026</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6 text-sm text-gray-700 leading-relaxed">
        {isPrivacy ? (
          <>
            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">1. Information We Collect</h2>
              <p>
                CRUNCHX collects consumer information when you place an order, create an account, or contact our customer support. This includes your name, shipping address, contact email, phone number, and payment transaction metadata.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">2. Payment & Financial Security</h2>
              <p>
                We do not store your complete credit card or net banking details on our servers. All financial transactions are processed securely through PCI-DSS Level 1 compliant payment gateways with end-to-end tokenization.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">3. Usage of Information</h2>
              <p>
                Your information is used strictly to fulfill orders, generate shipping air waybills (AWBs), provide delivery tracking alerts, and ensure compliance with food safety regulations.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">4. Your Privacy Rights</h2>
              <p>
                You may request access to, correction of, or deletion of your personal data at any time by contacting support@crunchx.com.
              </p>
            </section>
          </>
        ) : (
          <>
            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">1. Agreement to Terms</h2>
              <p>
                By accessing or purchasing from the CRUNCHX online storefront, you agree to be bound by these Terms of Service and all applicable food safety regulations.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">2. Products & Nutritional Disclaimers</h2>
              <p>
                All nutritional values, dietary tags (Gluten-Free, Vegan, Keto), and allergen statements are based on laboratory testing of our production recipes. Consumers with severe clinical allergies are encouraged to inspect detailed ingredient lists before consumption.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">3. Shipping, Cancellations & Returns</h2>
              <p>
                Orders are processed and dispatched within 24-48 business hours. Cancellations can be requested before dispatch. Due to the perishable nature of consumable food items, returns are only accepted in cases of damaged transit packages or quality defects verified by our QA team.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">4. Limitation of Liability</h2>
              <p>
                CRUNCHX shall not be liable for any indirect, incidental, or consequential damages resulting from product use or delivery delays caused by external courier providers.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
