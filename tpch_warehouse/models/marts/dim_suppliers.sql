with suppliers as (

    select * from {{ ref('stg_supplier') }}

),

nations as (

    select * from {{ ref('stg_nation') }}

),

regions as (

    select * from {{ ref('stg_region') }}

),

final as (

    select
        -- primary key
        suppliers.supplier_key,

        -- supplier identity
        suppliers.supplier_name,
        suppliers.supplier_address,
        suppliers.phone_number,
        suppliers.account_balance,

        -- fully resolved geography
        nations.nation_key,
        nations.nation_name,
        regions.region_key,
        regions.region_name

    from suppliers
    inner join nations
        on suppliers.nation_key = nations.nation_key
    inner join regions
        on nations.region_key = regions.region_key

)

select * from final
