def build_context(data: dict) -> str:

    sections = []

    for tool_name, tool_data in data.items():
        
        normalized_name = tool_name.replace("get_", "")

        if normalized_name == "revenue":

            sections.append(f"""
REVENUE DATA

Total Revenue: ₹{tool_data.get("totalRevenue", 0)}
Monthly Revenue: ₹{tool_data.get("monthRevenue", 0)}
Today's Revenue: ₹{tool_data.get("todayRevenue", 0)}
Completed Orders: {tool_data.get("completedOrders", 0)}
""")

        elif normalized_name == "profit":

            sections.append(f"""
PROFIT DATA

Total Revenue: ₹{tool_data.get("totalRevenue", 0)}
Total Expenses: ₹{tool_data.get("totalExpenses", 0)}
Net Profit: ₹{tool_data.get("netProfit", 0)}
Profit Margin: {tool_data.get("profitMargin", 0)}%
""")

        elif normalized_name == "orders":

            sections.append(f"""
ORDERS DATA

Total Orders: {tool_data.get("totalOrders", 0)}
Completed Orders: {tool_data.get("completed", 0)}
Delivered Orders: {tool_data.get("delivered", 0)}
Pending Review: {tool_data.get("pendingReview", 0)}
Rejected Orders: {tool_data.get("rejected", 0)}
Total Trays: {tool_data.get("totalTrays", 0)}
""")

        elif normalized_name == "expenses":

            sections.append(f"""
        EXPENSE DATA

        Total Expenses: ₹{tool_data.get("totalExpenses", 0)}
        Expense Records: {tool_data.get("expenseRecords", 0)}
        """)

        elif normalized_name == "customers":

            sections.append(f"""
CUSTOMER DATA

Total Customers: {tool_data.get("totalCustomers", 0)}
Top Customer: {tool_data.get("topCustomer")}
Top Customer Revenue: ₹{tool_data.get("topRevenue", 0)}

Customer Breakdown:

{tool_data.get("customers", {})}

""")

        elif normalized_name == "overview":

            revenue = tool_data.get("revenue", {})
            profit = tool_data.get("profit", {})
            orders = tool_data.get("orders", {})
            customers = tool_data.get("customers", {})

            sections.append(f"""
BUSINESS OVERVIEW

Revenue:
- Total Revenue: ₹{revenue.get("totalRevenue", 0)}
- Monthly Revenue: ₹{revenue.get("monthRevenue", 0)}

Profit:
- Net Profit: ₹{profit.get("netProfit", 0)}
- Profit Margin: {profit.get("profitMargin", 0)}%

Orders:
- Total Orders: {orders.get("totalOrders", 0)}
- Completed Orders: {orders.get("completed", 0)}

Customers:
- Total Customers: {customers.get("totalCustomers", 0)}
- Top Customer: {customers.get("topCustomer")}
""")

        elif normalized_name == "expense_categories":

            sections.append(f"""
        EXPENSE CATEGORY DATA

        Largest Category:
        {tool_data.get("largestCategory")}

        Largest Amount:
        ₹{tool_data.get("largestAmount")}

        Categories:

        {tool_data.get("categories")}
        """)

        elif normalized_name == "order_records":

            if not isinstance(tool_data, list):
                tool_data = [tool_data]

            records_text = ""

            for index, record in enumerate(tool_data, start=1):


                records_text += f"""
        Customer: {record.get("customer")}
        Quantity: {record.get("quantity")}
        Revenue: ₹{record.get("revenue")}
        Status: {record.get("status")}
        Delivery Date: {record.get("deliveryDate")}
        Order Date: {record.get("createdAt")}

        """

            sections.append(
                f"""
        ORDER RECORDS

        {records_text}
        """
            )

        elif normalized_name == "customer_details":
            if not isinstance(tool_data, list):
                tool_data = [tool_data]

            for customer in tool_data:

                sections.append(f"""
        CUSTOMER DETAILS

        Customer:
        {customer.get("customer")}

        Total Orders:
        {customer.get("totalOrders", 0)}

        Total Revenue:
        ₹{customer.get("totalRevenue", 0)}

        Total Trays:
        {customer.get("totalTrays", 0)}

        Last Order Date:
        {customer.get("lastOrderDate")}

        Last Order Status:
        {customer.get("lastOrderStatus")}

        Last Delivery Date:
        {customer.get("lastDeliveryDate")}
        """)

        elif normalized_name == "orders_between_dates":

            sections.append(f"""
        DATE RANGE REPORT

        Start Date:
        {tool_data.get("startDate")}

        End Date:
        {tool_data.get("endDate")}

        Total Orders:
        {tool_data.get("totalOrders")}

        Total Revenue:
        ₹{tool_data.get("totalRevenue")}

        Total Trays:
        {tool_data.get("totalTrays")}
        """)

        elif normalized_name == "business_health":

            sections.append(f"""
        BUSINESS HEALTH

        Health Score:
        {tool_data.get("healthScore")}

        Status:
        {tool_data.get("status")}

        Strengths:
        {tool_data.get("strengths")}

        Issues:
        {tool_data.get("issues")}

        Recommendations:
        {tool_data.get("recommendations")}

        Priorities:
        {tool_data.get("priorities")}
        """)


        elif normalized_name == "revenue_trends":

            sections.append(f"""
        REVENUE TREND ANALYSIS

        Interpretation:

        If growth is positive:
        Revenue is improving compared to the previous month.

        If growth is negative:
        Revenue has declined compared to the previous month.

        Business Impact:
        Revenue trends directly influence profitability,
        cash flow, and business expansion opportunities.

        Current Month:
        {tool_data.get("currentMonth")}

        Current Revenue:
        ₹{tool_data.get("currentRevenue")}

        Previous Month:
        {tool_data.get("previousMonth")}

        Previous Revenue:
        ₹{tool_data.get("previousRevenue")}

        Growth:
        {tool_data.get("displayGrowth", tool_data.get("growthPercent"))}%

        Trend:
        {tool_data.get("trend")}

        Best Month:
        {tool_data.get("bestMonth")}

        Best Revenue:
        ₹{tool_data.get("bestRevenue")}
        """)


        elif normalized_name == "dormant_customers":

            dormant_text = ""

            for customer in tool_data.get(
                "dormantCustomers",
                []
            ):

                dormant_text += f"""
        Customer: {customer.get("customer")}
        Days Inactive: {customer.get("daysInactive")}
        Last Order Date: {customer.get("lastOrderDate")}

        """

            sections.append(
                f"""
        DORMANT CUSTOMER ANALYSIS
        Business Insight:

        Dormant customers represent potential lost revenue.

        Re-engaging these customers can increase repeat sales
        without acquiring entirely new customers.

        Recommended Action:
        Contact inactive customers and encourage repeat orders.

        Threshold Days:
        {tool_data.get("thresholdDays")}

        Dormant Customer Count:
        {tool_data.get("count")}

        Dormant Customers:

        {dormant_text}
        """
            )

        elif normalized_name == "customer_segments":

            vip_text = ""

            for customer in tool_data.get(
                "vipCustomers",
                []
            ):

                vip_text += f"""
        {customer.get("customer")}
        Revenue: ₹{customer.get("revenue")}
        Orders: {customer.get("orders")}
        Trays: {customer.get("trays")}

        """

            regular_text = ""

            for customer in tool_data.get(
                "regularCustomers",
                []
            ):

                regular_text += f"""
        {customer.get("customer")}
        Revenue: ₹{customer.get("revenue")}
        Orders: {customer.get("orders")}
        Trays: {customer.get("trays")}

        """

            low_text = ""

            for customer in tool_data.get(
                "lowActivityCustomers",
                []
            ):

                low_text += f"""
        {customer.get("customer")}
        Revenue: ₹{customer.get("revenue")}
        Orders: {customer.get("orders")}
        Trays: {customer.get("trays")}

        """

            sections.append(
                f"""
        CUSTOMER SEGMENTATION

        VIP CUSTOMERS
        Definition:
            Customers generating the highest revenue,
            largest tray volume,
            and strongest business value.

        {vip_text}
        Business Insight:
            These customers should be prioritized for retention,
            relationship management, and volume growth.

        REGULAR CUSTOMERS
        Definition:
            Customers with moderate purchasing activity.

            Potential Upgrade Candidates:
            Customers who could become VIP customers
            through increased order frequency,
            larger tray purchases,
            or stronger retention.

        {regular_text}
        Business Insight:
            These customers are potential VIP upgrade candidates.


        LOW ACTIVITY CUSTOMERS
        Definition:
        Customers with low order frequency or low revenue.

        {low_text}
        Business Insight:
            These customers are at risk of becoming dormant and
            may require re-engagement campaigns.
        """
            )

        elif normalized_name == "customer_rankings":

            revenue_text = ""

            for index, customer in enumerate(
                tool_data.get(
                    "topRevenueCustomers",
                    []
                ),
                start=1,
            ):

                revenue_text += f"""
        {index}. {customer.get("customer")}
        Revenue: ₹{customer.get("revenue")}
        Orders: {customer.get("orders")}
        Trays: {customer.get("trays")}

        """

            tray_text = ""

            for index, customer in enumerate(
                tool_data.get(
                    "topTrayCustomers",
                    []
                ),
                start=1,
            ):

                tray_text += f"""
        {index}. {customer.get("customer")}
        Trays: {customer.get("trays")}
        Revenue: ₹{customer.get("revenue")}

        """

            sections.append(
                f"""
        CUSTOMER INTELLIGENCE

        VIP Customer:
        {tool_data.get("vipCustomer")}

        Definition:
            VIP customers generate the highest business value through
            revenue contribution, tray volume, and purchasing activity.

            Business Insight:
            VIP customers should be prioritized for retention,
            relationship management, and repeat business growth.

        TOP REVENUE CUSTOMERS

        {revenue_text}

        TOP TRAY CUSTOMERS

        {tray_text}
        """
            )



        else:

            sections.append(str(tool_data))

        

    return "\n".join(sections)