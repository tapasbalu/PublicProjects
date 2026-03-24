with source as (

    select * from {{ source('tpch', 'nation') }}

),

renamed as (

    select
        -- primary key
        n_nationkey     as nation_key,

        -- foreign keys
        n_regionkey     as region_key,

        -- nation attributes
        n_name          as nation_name,
        n_comment       as nation_comment

    from source

)

select * from renamed
