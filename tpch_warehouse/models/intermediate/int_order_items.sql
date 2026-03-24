with orders as (

    select * from {{ ref('stg_orders') }}

),

lineitem as (

    select * from {{ ref('stg_lineitem') }}

),

joined as (

    select
        -- order-level keys and attributes
        orders.order_key,
        orders.customer_key,
        orders.order_status,
        orders.order_date,
        orders.order_priority,
        orders.clerk_name,
        orders.ship_priority,

        -- line item keys
        lineitem.line_number,
        lineitem.part_key,
        lineitem.supplier_key,

        -- line item measures
        lineitem.quantity,
        lineitem.extended_price,
        lineitem.discount_percentage,
        lineitem.tax_percentage,
        lineitem.net_revenue,
        lineitem.gross_revenue,

        -- line item status
        lineitem.return_flag,
        lineitem.line_status,

        -- shipping dates
        lineitem.ship_date,
        lineitem.commit_date,
        lineitem.receipt_date,
        lineitem.ship_instructions,
        lineitem.ship_mode,

        -- calculated fulfillment metrics
        datediff('day', orders.order_date, lineitem.ship_date)      as days_to_ship,
        datediff('day', lineitem.ship_date, lineitem.receipt_date)  as days_in_transit

    from orders
    inner join lineitem
        on orders.order_key = lineitem.order_key

)

select * from joined
