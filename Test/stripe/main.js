const stripe = Stripe("pk_test_51SiVxnJ7t3J5nMf6S27rcXJrY0T0mkR93ct5KNbmP9X1o12tgCRvAn6x910ONCHd605coYiWczJJu2VwxU7KKODP00rwN2gjel"); // your Stripe publishable key
// const stripe = Stripe("pk_test_your_key"); // your publishable key

async function initPayment() {
    // 1. Create payment intent on server
    const res = await fetch("http://localhost:3000/api/v1/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            amount: 2500,
            currency: "lkr",
            orderId: "ORDER123",
            items: [{ productId: "123", name: "Test Product", price: 2500, quantity: 1 }]
        })
    });


    const data = await res.json();
    const clientSecret = data.clientSecret;

    // 2. Setup Stripe Elements
    const elements = stripe.elements({ clientSecret });
    const paymentElement = elements.create("payment");
    paymentElement.mount("#payment-element");

    // 3. Handle form submission
    const form = document.getElementById("payment-form");
    const messageEl = document.getElementById("payment-message");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.href // optional: redirect after payment
            }
        });

        if (error) {
            messageEl.textContent = error.message;
        } else {
            messageEl.textContent = "Payment submitted!";
        }
    });
}

initPayment();
