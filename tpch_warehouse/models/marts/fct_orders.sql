with order_items as (

    select * from {{ ref('int_order_items') }}

),

final as (

    select
        -- surrogate-friendly primary key (order + line)
        order_key,
        line_number,

        -- foreign keys to dimensions
        customer_key,
        part_key,
        supplier_key,

        -- order attributes (degenerate dimensions)
        order_status,
        order_date,
        order_priority,
        clerk_name,
        ship_priority,
        return_flag,
        line_status,
        ship_mode,
        ship_instructions,

        -- date dimensions (for slicing by time)
        ship_date,
        commit_date,
        receipt_date,

        -- measures
        quantity,
        extended_price,
        discount_percentage,
        tax_percentage,
        net_revenue,
        gross_revenue,

        -- fulfillment KPIs
        days_to_ship,
        days_in_transit

    from order_items

)

select * from final
