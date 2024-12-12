import React from 'https://cdn.jsdelivr.net/npm/react@18.2.0/+esm'
import reactDom from 'https://cdn.jsdelivr.net/npm/react-dom@18.2.0/+esm'
import { Button, Card } from 'https://cdn.jsdelivr.net/npm/antd@5.11.1/+esm'
import Markdown from 'https://cdn.jsdelivr.net/npm/react-markdown@9.0.1/+esm'


function App() {
	const [orders, setOrders] = React.useState(appsmith.model.data ?? []);

	const handleCompleteOrder = (orderId) => {
		// Trigger an event or perform an action when the "Complete Order" button is clicked
		appsmith.triggerEvent("completeOrder", { orderId: orderId });

		// Remove the order from the list
		setOrders((prevOrders) => prevOrders.filter((order) => order.order_details.id !== orderId));
	};

	return (
		<div className="grid-container">
		{orders.length > 0 ? (
		orders.map((order) => (
		<Card className="order-card" key={order.order_details.id}>
		<h3>Order #{order.order_details.id}</h3>
<h4>Meals:</h4>
{(order.order_details?.meals ?? []).map((meal) => (
	<div className="meal-container" key={meal.id}>
																				<p><strong>Meal Type:</strong> {meal.meal_type.name}</p>
																				<h5>Meal Items:</h5>
																				<ul>
																				{(meal.meal_items ?? []).map((item) => (
	<li key={item.id}>{item.menu_item.name}</li>
))}
	</ul>
</div>
))}
	<Button
className="primary"
onClick={() => handleCompleteOrder(order.order_details.id)}
type="primary"
>
	Complete Order
		</Button>
</Card>
))
) : (
	<div className="no-orders-message">No active orders</div>
)}
	</div>
);
}



appsmith.onReady(() => {
	/*
	 * This handler function will get called when parent application is ready.
	 * Initialize your component here
	 * more info - https://docs.appsmith.com/reference/widgets/custom#onready
	 */
	reactDom.render(<App />, document.getElementById("root"));
});
