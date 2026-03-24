with customer_locations as (

    select * from {{ ref('int_customer_locations') }}

),

final as (

    select
        -- primary key
        customer_key,

        -- customer identity
        customer_name,
        customer_address,
        phone_number,
        market_segment,
        account_balance,

        -- fully resolved geography (no foreign keys — analysts see names)
        nation_key,
        nation_name,
        region_key,
        region_name

    from customer_locations

)

select * from final
