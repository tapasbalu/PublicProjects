with customers as (

    select * from {{ ref('stg_customer') }}

),

nations as (

    select * from {{ ref('stg_nation') }}

),

regions as (

    select * from {{ ref('stg_region') }}

),

joined as (

    select
        -- customer keys and identity
        customers.customer_key,
        customers.customer_name,
        customers.customer_address,
        customers.phone_number,
        customers.account_balance,
        customers.market_segment,

        -- geographic context (fully resolved — no foreign keys exposed)
        nations.nation_key,
        nations.nation_name,
        regions.region_key,
        regions.region_name

    from customers
    inner join nations
        on customers.nation_key = nations.nation_key
    inner join regions
        on nations.region_key = regions.region_key

)

select * from joined
